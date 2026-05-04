import { toast } from "sonner";

export async function handleLimitedApiCall(
  response: Response,
  showUpgradeModal: (limitType: any) => void
): Promise<{ data: any, limited: boolean }> {
  if (response.status === 403) {
    const error = await response.json();
    if (error.error === 'limit_reached') {
      showUpgradeModal(error.limit_type);
      toast.info('Limit Reached', { 
        description: 'Upgrade your plan to unlock unlimited access to this feature.' 
      });
      return { data: null, limited: true };
    }
  }
  
  const data = await response.json();
  return { data, limited: false };
}
