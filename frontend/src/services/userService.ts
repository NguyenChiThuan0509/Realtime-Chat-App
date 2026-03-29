import api from "@/lib/axios";

export const userService = {
    uploadAvatar: async (formData: FormData) => {
        const res = await api.post("/users/uploadAvatar", formData);

        if (res.status === 400) {
            throw new Error(res.data.message);
        }

        return res.data;
    },
};