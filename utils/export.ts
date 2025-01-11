export function exportToCSV(data: any[], filename: string) {
    // Map headers from our data
    const headers = [
        'Name',
        'SKU',
        'Unit',
        'Minimum Stock',
        'Current Stock',
        'Price (€)',
        'Version'
    ]

    // Transform data to CSV format
    const rows = data.map(item => [
        item.name,
        item.sku,
        item.unit,
        item.minimumStock,
        item.warehouses?.reduce((sum: number, w: any) => sum + w.currentStock, 0) || 0,
        item.supplierPrice,
        `v${item.currentVersion}`
    ])

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}