import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

interface BreadcrumbItem {
    label: string
    href: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            {index === items.length - 1 ? (
                                <span className="ml-1 text-sm font-medium text-gray-400 md:ml-2">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    )
}
