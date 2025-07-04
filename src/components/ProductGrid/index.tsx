import Link from 'next/link'
import { Product } from '@/payload-types'
import { Media } from '@/components/Media'

interface ProductGridProps {
  products: Product[]
  className?: string
}

export function ProductGrid({ products, className = '' }: ProductGridProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  // Get main image
  const mainImage = product.gallery && product.gallery.length > 0 ? product.gallery[0] : null

  // Calculate pricing
  const currentPrice = product.pricing.salePrice || product.pricing.basePrice
  const originalPrice = product.pricing.basePrice
  const isOnSale = !!product.pricing.salePrice
  const savings = isOnSale ? originalPrice - currentPrice : 0
  const savingsPercent = isOnSale ? Math.round((savings / originalPrice) * 100) : 0

  // Check availability
  const isInStock = !product.inventory?.trackQuantity ||
    (product.inventory.quantity && product.inventory.quantity > 0) ||
    product.inventory?.allowBackorder

  const stockLevel = product.inventory?.trackQuantity ? product.inventory.quantity : null
  const isLowStock = stockLevel !== null && typeof stockLevel === 'number' && stockLevel <= (product.inventory?.lowStockThreshold || 5)

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group-hover:-translate-y-1">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {mainImage ? (
            <Media
              resource={mainImage.image}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              alt={mainImage.alt || product.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                Featured
              </span>
            )}
            {isOnSale && (
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                -{savingsPercent}%
              </span>
            )}
            {!isInStock && (
              <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                Out of Stock
              </span>
            )}
            {isLowStock && isInStock && (
              <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                Low Stock
              </span>
            )}
          </div>

          {/* Product Type Badge */}
          <div className="absolute top-2 right-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium capitalize">
              {product.productType.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Title & Description */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
              {product.title}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ${currentPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.pricing.compareAtPrice && product.pricing.compareAtPrice > currentPrice && (
              <p className="text-xs text-gray-500">
                Compare at ${product.pricing.compareAtPrice.toFixed(2)}
              </p>
            )}
          </div>

          {/* Service Details (if applicable) */}
          {product.serviceDetails && ['service', 'experience', 'consultation', 'course'].includes(product.productType) && (
            <div className="text-xs text-gray-600 mb-3 space-y-1">
              {product.serviceDetails.duration && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{product.serviceDetails.duration} min</span>
                </div>
              )}
              {product.serviceDetails.location && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{product.serviceDetails.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Stock Status */}
          <div className="text-xs mb-3">
            {isInStock ? (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>In Stock</span>
                {isLowStock && stockLevel !== null && (
                  <span className="text-orange-600">({stockLevel} left)</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Out of Stock</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="text-xs text-gray-500 mb-3">
              <span className="line-clamp-1">
                {product.categories.slice(0, 2).map((cat, index) => (
                  <span key={typeof cat === 'object' ? cat.id : cat}>
                    {index > 0 && ', '}
                    {typeof cat === 'object' ? cat.title : ''}
                  </span>
                ))}
                {product.categories.length > 2 && (
                  <span> +{product.categories.length - 2} more</span>
                )}
              </span>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                >
                  {tag.tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{product.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <div className="text-xs text-gray-400 font-mono">
              SKU: {product.sku}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
