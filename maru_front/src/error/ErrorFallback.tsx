import type { FC } from "react"
import { Button } from "@/components/ui/button"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ErrorFallback: FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <article
      className={`flex flex-col items-center justify-center gap-4 h-[90vh]`}
    >
      <h1 className='text-8xl font-bold'>{`ERROR`}</h1>
      <h2 className='text-5xl font-semibold'>에러가 발생하였습니다.</h2>
      <p className='text-lg'>{error.message}</p>
      <br />
      <Button
        size={"lg"}
        className='text-xl p-6 mt-4'
        onClick={resetErrorBoundary}
      >
        다시 시도
      </Button>
      <a href='/'>홈으로 이동</a>
    </article>
  )
}

export default ErrorFallback
