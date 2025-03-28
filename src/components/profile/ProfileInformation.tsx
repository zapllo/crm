import { 
    Card, 
    CardContent,
    CardHeader,
    CardTitle
  } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  
  interface ProfileInformationProps {
    user: {
      firstName?: string;
      lastName?: string;
      email: string;
      whatsappNo?: string;
      role:{
        name:string;
      };
      isOrgAdmin: boolean;
      organization?: {
        companyName: string;
        isPro: boolean;
        trialExpires: string;
        subscribedPlan?: string;
      };
    };
  }
  
  export function ProfileInformation({ user }: ProfileInformationProps) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="First Name" value={user.firstName || 'Not set'} />
            <InfoItem label="Last Name" value={user.lastName || 'Not set'} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="WhatsApp" value={user.whatsappNo || 'Not set'} />
          </div>
        </div>
  
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Role Information</h3>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{user.role.name || 'Standard User'}</p>
                </div>
                {user.isOrgAdmin && (
                  <Badge className="bg-blue-600">Organization Admin</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
  
        {user.organization && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Organization</h3>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{user.organization.companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.organization.isPro ? (
                    <Badge className="bg-green-600">Pro Plan</Badge>
                  ) : (
                    <Badge variant="outline">Free Plan</Badge>
                  )}
                  
                  {user.organization.subscribedPlan && (
                    <Badge className="bg-purple-600">{user.organization.subscribedPlan}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }
  
  function InfoItem({ label, value }: { label: string; value: string }) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    );
  }