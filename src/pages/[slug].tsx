import Detail from "src/routes/Detail"
import { filterPosts } from "src/libs/utils/notion"
import { CONFIG } from "site.config"
import { NextPageWithLayout } from "../types"
import CustomError from "src/routes/Error"
import { getRecordMap, getPosts } from "src/apis"
import MetaConfig from "src/components/MetaConfig"
import { GetStaticProps } from "next"
import { queryClient } from "src/libs/react-query"
import { queryKey } from "src/constants/queryKey"
import { dehydrate } from "@tanstack/react-query"
import usePostQuery from "src/hooks/usePostQuery"
import { FilterPostsOptions } from "src/libs/utils/notion/filterPosts"

const filter: FilterPostsOptions = {
  acceptStatus: ["Public", "PublicOnDetail"],
  acceptType: ["Paper", "Post", "Page"],
}

export const getStaticPaths = async () => {
  const posts = await getPosts()
  const filteredPost = filterPosts(posts, filter)
  return {
    paths: filteredPost.map((row) => `/${row.slug}`),
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug as string
  const posts = await getPosts()

  const feedPosts = filterPosts(posts)
  await queryClient.prefetchQuery(queryKey.posts(), () => feedPosts)

  const detailPosts = filterPosts(posts, filter)
  const postDetail = detailPosts.find((t: any) => t.slug === slug)

  if (!postDetail) {
    return { notFound: true }
  }

  try {
    const recordMap = await getRecordMap(postDetail.id)
    await queryClient.prefetchQuery(queryKey.post(`${slug}`), () => ({
      ...postDetail,
      recordMap,
    }))
    return {
      props: { dehydratedState: dehydrate(queryClient) },
      revalidate: CONFIG.revalidateTime,
    }
  } catch (error) {
    console.error("❌ [Props] 에러 발생:", error)
    return { notFound: true }
  }
}

const DetailPage: NextPageWithLayout = () => {
  const post = usePostQuery()
  if (!post) return <CustomError />

  const date = post.date?.start_date || post.createdTime || ""
  const meta = {
    title: post.title,
    date: new Date(date).toISOString(),
    image:
      post.thumbnail ??
      `${CONFIG.ogImageGenerateURL}/${encodeURIComponent(post.title)}.png`,
    description: post.summary || "",
    type: Array.isArray(post.type) ? post.type[0] : post.type,
    url: `${CONFIG.link}/${post.slug}`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Detail />
    </>
  )
}

DetailPage.getLayout = (page) => <>{page}</>
export default DetailPage
