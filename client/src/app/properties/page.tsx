import { redirect } from "next/navigation";
import { resolvePropertiesRedirect } from "@/utils/propertyFilterParams";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") {
      urlParams.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => urlParams.append(key, item));
    }
  });

  redirect(resolvePropertiesRedirect(urlParams));
}
