// import { useQuery } from "@tanstack/react-query";
// import { fetchRepoOverview } from "../api/analytics.service";
// import { transformRepoOverview } from "../utils/dataTransformer";
// import { analyticsCacheConfig } from "../utils/cacheConfig";
// import { OverviewSummary } from "../../../shared/types/analytics.types";

// export const useRepoOverview = (repoId: string | undefined) => {
//   return useQuery<OverviewSummary>({
//     queryKey: ["repoOverview", repoId],
//     queryFn: async () => {
//       const raw = await fetchRepoOverview(repoId as string);
//       return transformRepoOverview(raw);
//     },
//     enabled: Boolean(repoId),
//     ...analyticsCacheConfig.overview,
//   });
// };
import {useQuery} from "@tanstack/react-query";
import {getAnalytics} from "../api/analytics.service";


export const useRepoOverview=(projectId:number)=>{


return useQuery({

queryKey:[
"repo-overview",
projectId
],


queryFn:()=>getAnalytics(projectId),


enabled:!!projectId


});


};