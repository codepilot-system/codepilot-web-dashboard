import {
useQuery,
useMutation
} from "@tanstack/react-query";


import {
getScans,
startScan
} from "../api/analytics.service";



export const useScans=(projectId:number)=>{


return useQuery({

queryKey:["scans",projectId],

queryFn:()=>getScans(projectId),

enabled:!!projectId

});


};



export const useStartScan=()=>{


return useMutation({

mutationFn:
({
 projectId,
 branchName
}:{
 projectId:number,
 branchName:string
})=>
startScan(projectId,branchName)

});


};