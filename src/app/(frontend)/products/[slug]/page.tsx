import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductDetails } from '@/components/ProductDetails'
import { RelatedProducts } from '@/components/RelatedProducts'
import { AddToCartButton } from '@/components/AddToCartButton'
import RichText from '@/components/RichText'
import Link from 'next/link'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  try {
    const products = await payload.find({
      collection: 'products',
      where: {
        slug: { equals: slug },
        status: { equals: 'active' },
      },
      depth: 3,
      limit: 1,
    })

    const product = products.docs[0]

    if (!product) {
      notFound()
    }

    // Calculate pricing
    const currentPrice = product.pricing.salePrice || product.pricing.basePrice
    const originalPrice = product.pricing.basePrice
    const isOnSale = !!product.pricing.salePrice
    const savings = isOnSale ? originalPrice - currentPrice : 0
    const savingsPercent = isOnSale ? Math.round((savings / originalPrice) * 100) : 0

    // Check availability
    const isInStock = Boolean(
      !product.inventory?.trackQuantity ||
      (product.inventory?.quantity && product.inventory.quantity > 0) ||
      product.inventory?.allowBackorder
    )

    const stockLevel = product.inventory?.trackQuantity ? product.inventory.quantity : null
    const isLowStock = stockLevel !== null && typeof stockLevel === 'number' && stockLevel <= (product.inventory?.lowStockThreshold || 5)

    // Get related products
    let relatedProducts: any[] = []
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      const relatedData = await payload.find({
        collection: 'products',
        where: {
          id: { in: product.relatedProducts.map(p => typeof p === 'object' ? p.id : p) },
          status: { equals: 'active' },
        },
        depth: 1,
        limit: 4,
      })
      relatedProducts = relatedData.docs
    } else if (product.categories && product.categories.length > 0) {
      // If no related products, get products from same category
      const categoryData = await payload.find({
        collection: 'products',
        where: {
          categories: { contains: typeof product.categories[0] === 'object' ? product.categories[0].id : product.categories[0] },
          status: { equals: 'active' },
          id: { not_equals: product.id },
        },
        depth: 1,
        limit: 4,
        sort: '-featured',
      })
      relatedProducts = categoryData.docs
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery
              images={product.gallery || undefined}
              productTitle={product.title}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/products" className="hover:text-blue-600 transition-colors">
                Products
              </Link>
              {product.categories && product.categories.length > 0 && (
                <>
                  <span>›</span>
                  <Link
                    href={`/products/category/${typeof product.categories[0] === 'object' ? product.categories[0].slug : ''}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {typeof product.categories[0] === 'object' ? product.categories[0].title : ''}
                  </Link>
                </>
              )}
              <span>›</span>
              <span className="text-gray-900">{product.title}</span>
            </nav>

            {/* Product Title & SKU */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              {product.sku && (
                <p className="text-gray-500 text-sm">SKU: {product.sku}</p>
              )}
            </div>

            {/* Short Description */}
            {product.description && (
              <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${currentPrice.toFixed(2)}
                </span>
                {isOnSale && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      Save {savingsPercent}%
                    </span>
                  </>
                )}
              </div>
              {product.pricing.compareAtPrice && product.pricing.compareAtPrice > currentPrice && (
                <p className="text-sm text-gray-500">
                  Compare at ${product.pricing.compareAtPrice.toFixed(2)}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              {isInStock ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">In Stock</span>
                  {isLowStock && stockLevel !== null && (
                    <span className="text-orange-600 text-sm">
                      (Only {stockLevel} left!)
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Type Badge */}
            <div>
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {product.productType.replace('_', ' ')}
              </span>
              {product.featured && (
                <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium ml-2">
                  Featured
                </span>
              )}
            </div>

            {/* Service Details (if applicable) */}
            {product.serviceDetails && ['service', 'experience', 'consultation', 'course'].includes(product.productType) && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-medium text-gray-900">Service Details</h3>
                {product.serviceDetails.duration && (
                  <p className="text-sm text-gray-600">
                    <strong>Duration:</strong> {product.serviceDetails.duration} minutes
                  </p>
                )}
                {product.serviceDetails.location && (
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {product.serviceDetails.location}
                  </p>
                )}
                {product.serviceDetails.maxParticipants && (
                  <p className="text-sm text-gray-600">
                    <strong>Max Participants:</strong> {product.serviceDetails.maxParticipants}
                  </p>
                )}
                {product.serviceDetails.bookingRequired && (
                  <p className="text-sm text-orange-600 font-medium">
                    ⚠️ Booking required
                  </p>
                )}
              </div>
            )}

            {/* Digital Assets (if applicable) */}
            {product.digitalAssets && product.digitalAssets.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Digital Downloads Included</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {product.digitalAssets.map((asset, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span>{asset.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartButton
              product={product}
              isInStock={isInStock}
              className="w-full py-3 text-lg font-medium"
            />

            {/* Shipping Info */}
            {product.shipping?.requiresShipping && (
              <div className="text-sm text-gray-600 space-y-1 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Shipping Information</h4>
                {product.shipping.freeShipping ? (
                  <p className="text-green-600 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Free Shipping
                  </p>
                ) : (
                  <p>Shipping calculated at checkout</p>
                )}
                {product.shipping.shippingClass && (
                  <p>Shipping class: <span className="capitalize">{product.shipping.shippingClass}</span></p>
                )}
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 text-gray-900">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/products?search=${encodeURIComponent(tag.tag)}`}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      {tag.tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        {product.content && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Product Description</h2>
            <div className="prose max-w-none">
              <RichText data={product.content} />
            </div>
          </div>
        )}

        {/* Product Details */}
        <ProductDetails product={product} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">
              {product.relatedProducts && product.relatedProducts.length > 0
                ? 'Related Products'
                : 'You might also like'
              }
            </h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error loading product:', error)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Product not found
          </h1>
          <p className="text-gray-600 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  try {
    const products = await payload.find({
      collection: 'products',
      where: {
        slug: { equals: slug },
        status: { equals: 'active' },
      },
      limit: 1,
    })

    const product = products.docs[0]

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
      }
    }

    // Get main image for open graph
    const mainImage = product.gallery && product.gallery.length > 0 ? product.gallery[0] : null
    const imageUrl = mainImage && typeof mainImage.image === 'object' ? mainImage.image.url : null

    return {
      title: product.meta?.title || product.title,
      description: product.meta?.description || product.description || `${product.title} - ${product.pricing.basePrice ? `$${product.pricing.basePrice.toFixed(2)}` : 'Price on request'}`,
      keywords: product.meta?.keywords || product.tags?.map(t => t.tag).join(', '),
      openGraph: {
        title: product.title,
        description: product.description || '',
        images: imageUrl ? [
          {
            url: imageUrl,
            alt: mainImage?.alt || product.title,
          }
        ] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.description || '',
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for does not exist.',
    }
  }
}

// Generate static params for better performance
export async function generateStaticParams() {
  const payload = await getPayload({ config })

  try {
    const products = await payload.find({
      collection: 'products',
      where: {
        status: { equals: 'active' },
      },
      limit: 1000, // Adjust based on your needs
      select: {
        slug: true,
      },
    })

    return products.docs.map((product) => ({
      slug: product.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for products:', error)
    return []
  }
}
