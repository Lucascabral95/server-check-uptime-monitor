import { getUserById, getUsers, updateUserById, deleteUserById } from "@/lib/Resources/Api/UsersApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataUserGetDto } from "@/infraestructure/interfaces";

const useUsers = (id?: string) => {
  const queryClient = useQueryClient();

  const users = useQuery<DataUserGetDto[]>({
    queryKey: ["users"],
    queryFn: () => getUsers(),
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