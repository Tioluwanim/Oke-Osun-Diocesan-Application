import { API_BASE_URL } from '../constants/config';

export const uploadFileToGCS = async (file, token, folder = 'uploads') => {
  const uploadUrl = `${API_BASE_URL}/uploads`;
  if (!uploadUrl.startsWith(API_BASE_URL)) {
    throw new Error('Only production backend requests are allowed.');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || file.fileName || `upload-${Date.now()}`,
    type: file.mimeType || file.type || 'application/octet-stream',
  });
  formData.append('folder', folder);

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to upload file');
    }

    return data.url;
  } catch (error) {
    throw new Error(error.message || 'File upload failed');
  }
};
