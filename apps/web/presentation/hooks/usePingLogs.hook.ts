import { PingLogPaginationParams } from "@/infraestructure/interfaces";
import {
    getAllPingLogs,
    getPingLogById,
    findAllPingLogsById,
    deletePingLogById,
} from "@/lib/Resources/Api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UsePingLogsOptions {
    // GET /ping-log es solo-ADMIN (ver apps/backend-uptime/src/ping-log/ping-log.controller.ts).
    // Apagada por defecto para no disparar un request que un usuario normal no puede usar;
    // un futuro panel admin la prende explícitamente.
    enableAdminList?: boolean;
}

const usePingLogs = (id?: string, params?: PingLogPaginationParams, options?: UsePingLogsOptions) => {
    const queryClient = useQueryClient();

    // Queries
    const allPingLogs = useQuery({
        queryKey: ["pingLogs"],
        queryFn: () => getAllPingLogs(),
        enabled: options?.enableAdminList ?? false,
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