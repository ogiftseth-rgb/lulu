import NextLink from "next/link";
import type { ComponentProps } from "react";

export default function Link({ prefetch, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch ?? false} {...props} />;
}
