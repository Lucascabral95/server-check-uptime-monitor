import { PingLogPaginationParams } from "@/infraestructure/interfaces";
import {
    getAllPingLogs,
    getPingLogById,
    findAllPingLogsById,
    deletePingLogById,
} from "@/lib/Resources/Api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const usePingLogs = (id?: string, params?: PingLogPaginationParams) => {
    const queryClient = useQueryClient();

    // Queries
    const allPingLogs = useQuery({
        queryKey: ["pingLogs"],
        queryFn: () => getAllPingLogs(),
    });

    const pingLogById = useQuery({
        queryKey: ["pingLogById", id],
        queryFn: () => getPingLogById(id!),
        enabled: !!id,
    });

    const userPingLogs = useQuery({
        queryKey: ["userPingLogs", params],
        queryFn: () => findAllPingLogsById(params),
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePingLogById(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pingLogs"] });
            queryClient.invalidateQueries({ queryKey: ["userPingLogs"] });
        },
    });

    return {
        // Queries
        allPingLogs,
        pingLogById,
        userPingLogs,

        // Mutations
        deletePingLog: deleteMutation,
    };
};

export default usePingLogs;