import Navbar from '@/components/navbar/Navbar';
import ProfileSetup from '@/components/onboarding/ProfileSetup';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Suspense } from 'react';

export default function Onboard() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 pt-6">
        {/* Card container */}
        <Card className="max-w-3xl w-full shadow-lg h-[85vh] mt-5 ">
          <CardHeader>
            <CardTitle>Profile Setup</CardTitle>
            <CardDescription>
              Complete your profile by providing the necessary details.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Suspense fallback={<div>Loading profile setup...</div>}>
              <ProfileSetup />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
