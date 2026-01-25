"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import useUptime from "./useUptime.hook";

const ENDPOINT_HOME = "/dashboard/home"

const useMonitorById = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter()

    const { uptimeById } = useUptime(id!)

   const handleDetailsMonitor = () => {
      router.push(ENDPOINT_HOME)   
    }

    const redirectToLink = () => {
      window.open(`${uptimeById.data?.url}`, "_blank")
    }

    return {
      id,

      monitor: uptimeById.data,
      isLoading: uptimeById.isLoading,
      isError: uptimeById.isError,
      refetch: uptimeById.refetch,

      handleDetailsMonitor,
      redirectToLink,
    }
}

export default useMonitorById;