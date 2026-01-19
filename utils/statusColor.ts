export function getStatusColor(status: string): string {
  switch (status) {
    case "present":
      return "text-green-600 bg-green-100"
    case "absent":
      return "text-red-600 bg-red-100"
    case "late":
      return "text-yellow-600 bg-yellow-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}
