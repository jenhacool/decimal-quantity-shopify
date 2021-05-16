import { Heading, Page } from "@shopify/polaris";
import { useRouter } from "next/router"

const Config = () => {
  const router = useRouter();
  return (
    <Page>
      <Heading>Config page</Heading>
      {router.query.shop}
      {router.query.id}
    </Page>
  )
};

export default Config;