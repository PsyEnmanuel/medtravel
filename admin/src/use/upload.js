import { inject } from "vue";

export const useUpload = () => {
  const $api = inject("$api");
  return {
    async uploadFiles({ ref_key, ref_id, files, url = "file", file_type = 'GENERAL', insurance = null, insurance_id = null, $policy_type_id = null,
      policy_type = null }) {
      try {

        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
          formData.append("file", files[i]);
        }

        formData.append("ref_key", ref_key);
        formData.append("ref_id", ref_id);
        formData.append("insurance", insurance);
        formData.append("insurance_id", insurance_id);
        formData.append("policy_type", policy_type);
        formData.append("$policy_type_id", $policy_type_id);
        formData.append("file_type", file_type);
        formData.append("_files", JSON.stringify(files.map(i => ({
          description: i.description || i.name
        }))));

        const response = await $api.post(url, formData, {
          "Content-Type": "multipart/form-data",
        });
        return response;
      } catch (error) {
        console.log(error);
      }
    },
  };
};
