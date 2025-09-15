import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import React from 'react'

type Props = {}

export default function MainLoader({ }: Props) {
    return (
        <div className="absolute  w-screen h-screen  z-[100]  inset-0 bg-[#04061e] -900  bg-opacity-90 rounded-xl flex justify-center items-center">
            <div className=" z-[100]  max-h-screen max-w-screen text-[#D0D3D3] w-[100%] rounded-lg ">
                <div className="">
                    <div className="absolute z-50 inset-0 flex flex-col items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
                    <DotLottieReact
                  src="/lottie/loader.lottie"
                  loop
                  className="h-48"
                  autoplay
                /> 
                      
                    </div>
                </div>
            </div>
        </div>
    )
}