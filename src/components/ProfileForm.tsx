
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Define form validation schema
const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits').max(15).optional().or(z.literal('')),
  gender: z.string().optional(),
  college: z.string().min(2, 'College name must be at least 2 characters').max(100).optional().or(z.literal('')),
  hostel_room: z.string().max(50).optional().or(z.literal('')),
  department: z.string().min(2, 'Department name must be at least 2 characters').max(100).optional().or(z.literal('')),
  year_of_study: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal(''))
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileForm = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with React Hook Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
      gender: '',
      college: '',
      hostel_room: '',
      department: '',
      year_of_study: '',
      bio: '',
      location: ''
    }
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        gender: profile.gender || '',
        college: profile.college || '',
        hostel_room: profile.hostel_room || '',
        department: profile.department || '',
        year_of_study: profile.year_of_study || '',
        bio: profile.bio || '',
        location: profile.location || ''
      });
    }
  }, [profile, form]);

  // Form submission handler
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <ProfileImageUpload />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <Separator className="mb-4" />
            </div>

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <Input 
                value={user?.email || 'Not available'} 
                disabled 
                className="bg-muted cursor-not-allowed"
              />
              <FormDescription>Email cannot be changed</FormDescription>
            </FormItem>

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campus Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-4 mt-6">Campus Information</h3>
              <Separator className="mb-4" />
            </div>

            <FormField
              control={form.control}
              name="college"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College/University</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your college name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department/Branch</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year_of_study"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Study</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Alumni'].map((year) => (
                        <SelectItem key={year} value={year.toLowerCase()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hostel_room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostel/Room Number</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., H3-202" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* About Me */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-4 mt-6">About Me</h3>
              <Separator className="mb-4" />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Short Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write a short bio about yourself (optional)"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Write a few sentences about yourself that will help others know you better.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-rentmate-orange hover:bg-rentmate-orange/90"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileForm;
