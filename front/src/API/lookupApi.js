import axios from "axios";
import { API_BASE_URL } from "../Configs/apiBase";

async function fetchLookup(path) {
  const { data } = await axios.get(`${API_BASE_URL}${path}`);
  return (Array.isArray(data) ? data : []).map((row) => ({
    label: row.name,
    value: row.id,
  }));
}

export const lookupApi = {
  genders: () => fetchLookup("/lookups/genders/"),
  maritalStatuses: () => fetchLookup("/lookups/marital-status/"),
  specialties: () => fetchLookup("/lookups/specialties/"),
  healthAssistantCooperationTypes: () =>
    fetchLookup("/lookups/health-assistant-cooperation-types/"),
  educations: () => fetchLookup("/lookups/educations/"),
  jobStatuses: () => fetchLookup("/lookups/job-statuses/"),
  housingStatuses: () => fetchLookup("/lookups/housing-statuses/"),
  coveredOrganizations: () => fetchLookup("/lookups/covered-organizations/"),
  insurances: () => fetchLookup("/lookups/insurances/"),
  organizationTypes: () => fetchLookup("/lookups/organization-types/"),
};
