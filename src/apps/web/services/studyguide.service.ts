import { mockStudyGuides, getMockStudyGuide, type MockStudyGuide } from "@/mock/studyguides/data";
import { getApiClient } from "@/lib/api";
import { paginate } from "@/mock/seed";

export interface ListGuidesParams {
  page?: number;
  pageSize?: number;
  subjectId?: string;
}

export const studyguideService = {
  list(params: ListGuidesParams = {}) {
    const c = getApiClient();
    if (c.kind === "mock") {
      let items = [...mockStudyGuides];
      if (params.subjectId) {
        items = items.filter((g) => g.subjectId === params.subjectId);
      }
      return Promise.resolve(paginate(items, params.page ?? 1, params.pageSize ?? 20));
    }
    return c.real.get("/study-guides", { params }).then((r) => r.data);
  },

  get(id: string) {
    const c = getApiClient();
    if (c.kind === "mock") {
      return Promise.resolve(getMockStudyGuide(id) ?? null);
    }
    return c.real.get(`/study-guides/${id}`).then((r) => r.data);
  },
};

void mockStudyGuides;
void getMockStudyGuide;