import { getUserById, getUsers, updateUserById, deleteUserById } from "@/lib/Resources/Api/UsersApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataUserGetDto, GetAllUsersDto } from "@/infraestructure/interfaces";

interface UseUsersOptions {
  // GET /user es solo-ADMIN (ver apps/backend-uptime/src/user/user.controller.ts).
  // Apagada por defecto; un futuro panel admin la prende explícitamente.
  enableAdminList?: boolean;
}

const useUsers = (id?: string, options?: UseUsersOptions) => {
  const queryClient = useQueryClient();

  const users = useQuery<GetAllUsersDto>({
    queryKey: ["users"],
    queryFn: () => getUsers(),
    enabled: options?.enableAdminList ?? false,
  });

  const userById = useQuery<DataUserGetDto>({
    queryKey: ["userById", id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
  });

  const updateUser = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: { email?: string } }) =>
      updateUserById(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userById"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) => deleteUserById(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    users,
    userById,
    updateUser,
    deleteUser,
  };
};

export default useUsers;