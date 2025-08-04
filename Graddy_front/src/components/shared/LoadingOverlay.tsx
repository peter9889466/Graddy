import { Loader } from "lucide-react"
import type { FC } from "react"

const LoadingOverlay: FC = () => {
  return (
    <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-600/50 p-4 flex flex-col justify-center items-center z-[1000000] text-white text-sm font-semibold shadow-lg'>
      <div className='flex items-center justify-center flex-col gap-2'>
        <Loader className='w-16 h-16 animate-spin' />
      </div>
    </div>
  )
}

export default LoadingOverlay
