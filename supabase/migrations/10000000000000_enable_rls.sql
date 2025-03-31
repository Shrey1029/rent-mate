
-- Enable Row Level Security for items table
ALTER TABLE IF EXISTS public.items ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to view any item
CREATE POLICY IF NOT EXISTS "Anyone can view items" 
ON public.items FOR SELECT 
USING (true);

-- Policy to allow owners to update their own items
CREATE POLICY IF NOT EXISTS "Owners can update their own items" 
ON public.items FOR UPDATE 
USING (auth.uid() = owner_id);

-- Policy to allow owners to delete their own items
CREATE POLICY IF NOT EXISTS "Owners can delete their own items" 
ON public.items FOR DELETE 
USING (auth.uid() = owner_id);

-- Policy to allow authenticated users to insert items (they own)
CREATE POLICY IF NOT EXISTS "Users can insert their own items" 
ON public.items FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Enable Row Level Security for item_images table
ALTER TABLE IF EXISTS public.item_images ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to view any item images
CREATE POLICY IF NOT EXISTS "Anyone can view item images" 
ON public.item_images FOR SELECT 
USING (true);

-- Policy to allow owners to insert images for their own items
CREATE POLICY IF NOT EXISTS "Users can insert images for their own items" 
ON public.item_images FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.items 
  WHERE items.id = item_images.item_id 
  AND items.owner_id = auth.uid()
));

-- Policy to allow owners to delete images for their own items
CREATE POLICY IF NOT EXISTS "Users can delete images for their own items" 
ON public.item_images FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.items 
  WHERE items.id = item_images.item_id 
  AND items.owner_id = auth.uid()
));

-- Enable Row Level Security for rentals table
ALTER TABLE IF EXISTS public.rentals ENABLE ROW LEVEL SECURITY;

-- Policy to allow owners to view rentals of their items
CREATE POLICY IF NOT EXISTS "Item owners can view rentals of their items" 
ON public.rentals FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.items 
  WHERE items.id = rentals.item_id 
  AND items.owner_id = auth.uid()
));

-- Policy to allow renters to view their own rentals
CREATE POLICY IF NOT EXISTS "Renters can view their own rentals" 
ON public.rentals FOR SELECT 
USING (auth.uid() = renter_id);

-- Policy to allow authenticated users to insert rentals
CREATE POLICY IF NOT EXISTS "Users can create rentals" 
ON public.rentals FOR INSERT 
WITH CHECK (auth.uid() = renter_id);

-- Policy to allow owners to update rentals for their items
CREATE POLICY IF NOT EXISTS "Item owners can update rentals of their items" 
ON public.rentals FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.items 
  WHERE items.id = rentals.item_id 
  AND items.owner_id = auth.uid()
));

-- Policy to allow renters to update their own rentals
CREATE POLICY IF NOT EXISTS "Renters can update their own rentals" 
ON public.rentals FOR UPDATE 
USING (auth.uid() = renter_id);
