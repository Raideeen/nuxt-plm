type ExportData = {
    headers: string[]
    rows: (string | number)[][]
    summary?: (string | number)[]
}

export function exportToCSV(data: ExportData, filename: string) {
    // Combine all rows including headers and optional summary
    const allRows = [
        data.headers,
        ...data.rows,
        ...(data.summary ? [data.summary] : [])
    ]

    // Transform data to CSV format with proper escaping
    const csvContent = allRows.map(row =>
        row.map(cell => {
            const cellStr = String(cell)
            // Handle cells that contain commas, quotes, or newlines
            if (cellStr && (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n'))) {
                return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
        }).join(',')
    ).join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}