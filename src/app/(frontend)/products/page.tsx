import { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductFilters } from '@/components/ProductFilters'
import { Pagination } from '@/components/Pagination'
import Link from 'next/link'

interface SearchParams {
  category?: string
  search?: string
  price_min?: string
  price_max?: string
  type?: string
  page?: string
  sort?: string
  in_stock?: string
  featured?: string
  [key: string]: string | undefined
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const searchParamsResolved = await searchParams
  const payload = await getPayload({ config })

  // Build query conditions
  const where: any = {
    status: { equals: 'active' },
  }

  // Category filter
  if (searchParamsResolved.category) {
    where.categories = { contains: searchParamsResolved.category }
  }

  // Search filter
  if (searchParamsResolved.search) {
    where.or = [
      { title: { contains: searchParamsResolved.search } },
      { description: { contains: searchParamsResolved.search } },
      { 'tags.tag': { contains: searchParamsResolved.search } },
      { sku: { contains: searchParamsResolved.search } },
    ]
  }

  // Price range filter
  if (searchParamsResolved.price_min || searchParamsResolved.price_max) {
    where['pricing.basePrice'] = {}
    if (searchParamsResolved.price_min) {
      where['pricing.basePrice'].greater_than_equal = parseFloat(searchParamsResolved.price_min)
    }
    if (searchParamsResolved.price_max) {
      where['pricing.basePrice'].less_than_equal = parseFloat(searchParamsResolved.price_max)
    }
  }

  // Product type filter
  if (searchParamsResolved.type) {
    where.productType = { equals: searchParamsResolved.type }
  }

  // Stock filter
  if (searchParamsResolved.in_stock === 'true') {
    where.or = [
      { 'inventory.trackQuantity': { equals: false } },
      {
        and: [
          { 'inventory.trackQuantity': { equals: true } },
          { 'inventory.quantity': { greater_than: 0 } }
        ]
      },
      {
        and: [
          { 'inventory.trackQuantity': { equals: true } },
          { 'inventory.quantity': { equals: 0 } },
          { 'inventory.allowBackorder': { equals: true } }
        ]
      }
    ]
  }

  // Featured filter
  if (searchParamsResolved.featured === 'true') {
    where.featured = { equals: true }
  }

  // Pagination
  const page = parseInt(searchParamsResolved.page || '1')
  const limit = 12

  // Sort options
  const sortMap = {
    'price_asc': 'pricing.basePrice',
    'price_desc': '-pricing.basePrice',
    'newest': '-createdAt',
    'name': 'title',
    'featured': '-featured',
    'sku': 'sku',
  }
  const sort = sortMap[searchParamsResolved.sort as keyof typeof sortMap] || '-featured'

  try {
    // Fetch products
    const products = await payload.find({
      collection: 'products',
      where,
      sort,
      limit,
      page,
      depth: 2,
    })

    // Fetch categories for filters
    const categories = await payload.find({
      collection: 'categories',
      where: {
        isActive: { equals: true },
        parent: { exists: false }, // Only root categories
      },
      sort: 'displayOrder',
      depth: 1,
    })

    // Get product types for filters
    const productTypes = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      select: { productType: true },
      limit: 1000,
    })

    const uniqueProductTypes = Array.from(
      new Set(productTypes.docs.map(p => p.productType))
    ).sort()

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {searchParamsResolved.search
              ? `Search results for "${searchParamsResolved.search}"`
              : 'All Products'
            }
          </h1>

          {searchParamsResolved.search && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                Found <strong>{products.totalDocs}</strong> products matching &ldquo;{searchParamsResolved.search}&rdquo;
              </p>
              {products.totalDocs === 0 && (
                <div className="mt-3">
                  <p className="text-blue-700 font-medium">Try these search tips:</p>
                  <ul className="text-blue-600 text-sm mt-2 space-y-1">
                    <li>• Check your spelling</li>
                    <li>• Use fewer keywords</li>
                    <li>• Try more general terms</li>
                    <li>• Browse by categories instead</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80">
            <ProductFilters
              categories={categories.docs}
              productTypes={uniqueProductTypes}
              searchParams={searchParamsResolved}
              totalResults={products.totalDocs}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {products.docs.length > 0 ? (
              <>
                {/* Results header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <p className="text-gray-600">
                      Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, products.totalDocs)} of {products.totalDocs} products
                    </p>

                    {/* Active filters display */}
                    {(searchParamsResolved.category || searchParamsResolved.type || searchParamsResolved.price_min || searchParamsResolved.price_max || searchParamsResolved.in_stock || searchParamsResolved.featured) && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Filters:</span>
                        <div className="flex flex-wrap gap-1">
                          {searchParamsResolved.category && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              Category
                            </span>
                          )}
                          {searchParamsResolved.type && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {searchParamsResolved.type}
                            </span>
                          )}
                          {(searchParamsResolved.price_min || searchParamsResolved.price_max) && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              Price range
                            </span>
                          )}
                          {searchParamsResolved.in_stock === 'true' && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              In stock
                            </span>
                          )}
                          {searchParamsResolved.featured === 'true' && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      id="sort"
                      name="sort"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={searchParamsResolved.sort || 'featured'}
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name">Name A-Z</option>
                      <option value="sku">SKU</option>
                    </select>
                  </div>
                </div>

                {/* Product Grid */}
                <ProductGrid products={products.docs} />

                {/* Pagination */}
                <div className="mt-12">
                  <Pagination
                    page={products.page || 1}
                    totalPages={products.totalPages || 1}
                  />
                </div>
              </>
            ) : (
              /* No results state */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a2 2 0 00-2-2H7a2 2 0 00-2 2v1m14 0H5m11 1L9 19l-2-2" />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {searchParamsResolved.search ? 'No products found' : 'No products available'}
                  </h2>

                  <p className="text-gray-600 mb-6">
                    {searchParamsResolved.search
                      ? "We couldn&apos;t find any products matching your search criteria."
                      : "There are no products available at this time."
                    }
                  </p>

                  {/* Clear filters or browse categories */}
                  <div className="space-y-4">
                    {(searchParamsResolved.search || searchParamsResolved.category || searchParamsResolved.type || searchParamsResolved.price_min || searchParamsResolved.price_max) && (
                      <Link
                        href="/products"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Clear All Filters
                      </Link>
                    )}

                    {categories.docs.length > 0 && (
                      <div className="text-sm text-gray-500">
                        <p className="mb-3">Or browse by category:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {categories.docs.slice(0, 4).map((cat) => (
                            <a
                              key={cat.id}
                              href={`/products/category/${cat.slug}`}
                              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              {cat.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading products:', error)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;re having trouble loading the products. Please try again later.
          </p>
                                    <Link
                            href="/"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Return Home
                          </Link>
        </div>
      </div>
    )
  }
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const searchParamsResolved = await searchParams
  const title = searchParamsResolved.search
    ? `Search results for "${searchParamsResolved.search}" - Products`
    : 'All Products'

  const description = searchParamsResolved.search
    ? `Find products matching "${searchParamsResolved.search}"`
    : 'Browse our complete product catalog with advanced filtering and search'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}
