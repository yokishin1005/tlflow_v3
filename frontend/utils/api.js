const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchWithErrorHandling(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getEmployees() {
  return fetchWithErrorHandling(`${API_URL}/employees/`);
}

export async function getEmployee(id) {
  return fetchWithErrorHandling(`${API_URL}/employees/${id}`);
}

export async function getGrades() {
  return fetchWithErrorHandling(`${API_URL}/grades/`);
}

export async function getDepartments() {
  return fetchWithErrorHandling(`${API_URL}/departments/`);
}

export async function getJobPosts() {
  return fetchWithErrorHandling(`${API_URL}/jobposts/`);
}

export async function registerEmployee(employeeData) {
  const formData = new FormData();
  
  Object.keys(employeeData).forEach(key => {
    if (employeeData[key] instanceof File) {
      formData.append(key, employeeData[key]);
    } else if (key === 'birthdate' || key === 'hire_date') {
      formData.append(key, employeeData[key].toISOString().split('T')[0]);
    } else {
      formData.append(key, JSON.stringify(employeeData[key]));
    }
  });

  return fetchWithErrorHandling(`${API_URL}/employees/`, {
    method: 'POST',
    body: formData,
  });
}

export async function processRirekisho(file) {
  const formData = new FormData();
  formData.append('file', file);
  return fetchWithErrorHandling(`${API_URL}/process_rirekisho/`, {
    method: 'POST',
    body: formData,
  });
}

export async function processResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  return fetchWithErrorHandling(`${API_URL}/process_resume/`, {
    method: 'POST',
    body: formData,
  });
}

export async function processBigFive(file) {
  const formData = new FormData();
  formData.append('file', file);
  return fetchWithErrorHandling(`${API_URL}/process_bigfive/`, {
    method: 'POST',
    body: formData,
  });
}