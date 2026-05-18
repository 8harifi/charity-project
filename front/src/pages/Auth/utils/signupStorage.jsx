const STORAGE_KEY = "signup_draft";

const loadAll = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

export const saveStep = (role, step, data) => {

  const all = loadAll();

  const updated = {
    ...all,
    [role]: {
      ...(all[role] || {}),
      [step]: {
        ...(all?.[role]?.[step] || {}),
        ...data
      }
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const loadStep = (role, step) => {
  const all = loadAll();
  return all?.[role]?.[step] || {};
};

export const loadRoleDraft = (role) => {
  const all = loadAll();
  return all?.[role] || {};
};

export const clearRoleDraft = (role) => {

  const all = loadAll();

  delete all[role];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const clearAllDraft = () => {
  localStorage.removeItem(STORAGE_KEY);
};
