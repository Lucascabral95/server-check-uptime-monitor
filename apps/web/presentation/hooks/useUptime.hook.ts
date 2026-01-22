import {
    getAllUptimes,
    getUptimeById,
    createUptime,
    updateUptimeById,
    deleteUptimeById,
    getStatsUptime,
    forceFlushUptime,
} from "@/lib/Resources/Api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateUptimeDto, UpdateUptimeDto, GetAllUptimesDto } from "@/infraestructure/interfaces";
import { PaginationParams } from "@/infraestructure/interfaces";

const useUptime = (id?: string, params?: PaginationParams) => {
    const queryClient = useQueryClient();

    // Queries
    const uptimes = useQuery<GetAllUptimesDto>({
        queryKey: ["uptimes", params],
        queryFn: () => getAllUptimes(params),
    });

    const uptimeById = useQuery({
        queryKey: ["uptimeById", id],
        queryFn: () => getUptimeById(id!),
        enabled: !!id,
    });

    const stats = useQuery({
        queryKey: ["uptimeStats"],
        queryFn: () => getStatsUptime(),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: CreateUptimeDto) => createUptime(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["uptimes"] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUptimeDto }) =>
            updateUptimeById(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["uptimes"] });
            queryClient.invalidateQueries({ queryKey: ["uptimeById"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUptimeById(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["uptimes"] });
        },
    });

    const flushMutation = useMutation({
        mutationFn: () => forceFlushUptime(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["uptimeStats"] });
        },
    });

    return {
        // Queries
        uptimes,
        uptimeById,
        stats,

        // Mutations
        createUptime: createMutation,
        updateUptime: updateMutation,
        deleteUptime: deleteMutation,
        flushUptime: flushMutation,
    };
};

export default useUptime;