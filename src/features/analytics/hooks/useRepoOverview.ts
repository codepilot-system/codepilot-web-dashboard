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