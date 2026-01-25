import useUptime from "./useUptime.hook";

const useAllMonitorsWithIncidentsByUser = () => {
     const { incidentsByUser } = useUptime();

    return {
        data: incidentsByUser.data,
        isLoading: incidentsByUser.isLoading,
        isError: incidentsByUser.isError,
        refetch: incidentsByUser.refetch,
    }
}

export default useAllMonitorsWithIncidentsByUser;