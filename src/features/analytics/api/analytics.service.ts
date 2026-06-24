// import { api } from "../../../shared/api/axiosClient";
// import {
//   AnalyticsRange,
//   DebtTrendsRaw,
//   LanguageBreakdownRaw,
//   RepoOverviewRaw,
// } from "../../../shared/types/analytics.types";

// // -------------------------------------------------------------
// // Analytics REST surface
// // Backend contract (agreed between web + backend teams):
// //   GET  /analytics/:repoId/overview              -> RepoOverviewRaw
// //   GET  /analytics/:repoId/debt-trends?range=30d -> DebtTrendsRaw
// //   GET  /analytics/:repoId/language-breakdown    -> LanguageBreakdownRaw
// //
// // All envelopes use the standard `{ data: T }` shape that axiosClient
// // expects, so we strip it once here and return T to the hook layer.
// // -------------------------------------------------------------

// export const fetchRepoOverview = async (
//   repoId: string,
// ): Promise<RepoOverviewRaw> => {
//   const response = await api.get(`/analytics/${repoId}/overview`);
//   return response.data.data as RepoOverviewRaw;
// };

// export const fetchDebtTrends = async (
//   repoId: string,
//   range: AnalyticsRange = "30d",
// ): Promise<DebtTrendsRaw> => {
//   const response = await api.get(`/analytics/${repoId}/debt-trends`, {
//     params: { range },
//   });
//   return response.data.data as DebtTrendsRaw;
// };

// export const fetchLanguageBreakdown = async (
//   repoId: string,
// ): Promise<LanguageBreakdownRaw> => {
//   const response = await api.get(`/analytics/${repoId}/language-breakdown`);
//   return response.data.data as LanguageBreakdownRaw;
// };
import { api } from "../../../shared/api/axiosClient";


export const getAnalytics = async (
 projectId:number,
 scanId?:number
)=>{

 const response = await api.get("/analytics",{
   params:{
    projectId,
    scanId
   }
 });


 return response.data;

};



export const getScans = async (
 projectId:number
)=>{

 const response = await api.get("/scans",{
   params:{
    projectId
   }
 });


 return response.data;

};



export const startScan = async (
 projectId:number,
 branchName:string="main"
)=>{


const response = await api.post(
 "/scans",
 {
  projectId,
  branchName
 }
);


return response.data;


};



export const getReport = async (
 scanId:number
)=>{

const response = await api.get(
 `/scans/${scanId}/report`,
 {
  responseType:"blob"
 }
);


return response.data;

};