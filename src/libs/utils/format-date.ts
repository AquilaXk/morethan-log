export const formatDate = (
  input: string | number,
  lang: string = "en-US"
): string => {
  if (!input) return ""

  try {
    const date = new Date(input)

    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      return ""
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }

    return date.toLocaleDateString(lang, options)
  } catch (error) {
    console.error("formatDate error:", error)
    return ""
  }
}
