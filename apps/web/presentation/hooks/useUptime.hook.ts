import { 
    useQuery, 
    useMutation,
     useQueryClient,
     } from "@tanstack/react-query";
import {
    getAllUptimes,
    getUptimeById,
    createUptime,
    updateUptimeById,
    deleteUptimeById,
    getStatsUptime,
    forceFlushUptime,
    getMyStatsUser,
    getStatsLogsByUptimeId,
    getIncidents,
    getIncidentsByUser,
} from "@/lib/Resources/Api";
import { 
    CreateUptimeDto,
    UpdateUptimeDto,
    GetAllUptimesDto,
    GetStatsUserInterface,
    GetUptimeDto,
    GetStatsLogsByUptimeIdInterface,
    GetIncidentOfMonitorInterface,
    GetIncidentsByUserIdInterface,
} from "@/infraestructure/interfaces";
import { PaginationParams } from "@/infraestructure/interfaces";

const useUptime = (id?: string, params?: PaginationParams) => {
    const queryClient = useQueryClient();

    const uptimes = useQuery<GetAllUptimesDto>({
        queryKey: ["uptimes", params],
        queryFn: () => getAllUptimes(params),
        placeholderData: (previousData) => previousData,
    });

    const uptimeById = useQuery<GetUptimeDto>({
        queryKey: ["uptimeById", id],
        queryFn: () => getUptimeById(id!),
        enabled: !!id,
    });

    const stats = useQuery({
        queryKey: ["uptimeStats"],
        queryFn: () => getStatsUptime(),
    });

    const myStats = useQuery<GetStatsUserInterface>({
        queryKey: ["myStats"],
        queryFn: () => getMyStatsUser(),
    });

    const statsLogsByUptimeId = useQuery<GetStatsLogsByUptimeIdInterface>({
        queryKey: ["statsLogsByUptimeId", id],
        queryFn: () => getStatsLogsByUptimeId(id!),
        enabled: !!id,
    });

    const getIncidentsByMonitorId = useQuery<GetIncidentOfMonitorInterface>({
        queryKey: ["getIncidentsByMonitorId", id],
        queryFn: () => getIncidents(id!),
        enabled: !!id,
    });

    const incidentsByUser = useQuery<GetIncidentsByUserIdInterface>({
        queryKey: ["getIncidentsByUserId", params],
        queryFn: () => getIncidentsByUser({ search: params?.search, sortBy: params?.sortBy }),
        placeholderData: (previousData) => previousData,
    });

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
        uptimes,
        uptimeById,
        stats,
        myStats,
        statsLogsByUptimeId,
        getIncidentsByMonitorId,
        incidentsByUser,
        createUptime: createMutation,
        updateUptime: updateMutation,
        deleteUptime: deleteMutation,
        flushUptime: flushMutation,
    };
};

export default useUptime;