import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { FC } from "react"

interface Page404Props {
  error?: Error | string | null
}

const Page404: FC<Page404Props> = ({ error }) => {
  const navigate = useNavigate()
  if (error) {
    console.error("Navigation error:", error)
  }

  return (
    <article
      className={`flex flex-col items-center justify-center gap-4 h-[90vh]`}
    >
      <h1 className='text-8xl font-bold'>404</h1>
      <h1 className='text-5xl font-semibold'>죄송합니다.</h1>
      <h3 className='text-3xl font-semibold'>
        해당 페이지를 찾을 수 없습니다.
      </h3>

      <Button
        size={"lg"}
        className='text-xl p-6 mt-4'
        onClick={() => navigate("/")}
      >
        홈으로 이동
      </Button>
    </article>
  )
}

export default Page404
