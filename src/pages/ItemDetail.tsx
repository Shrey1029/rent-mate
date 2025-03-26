
// When displaying the price, convert it to Indian Rupees
<div className="flex items-center mb-2">
  <span className="text-2xl font-bold text-primary">₹{(item.price * 83).toFixed(0)}</span>
  <span className="text-muted-foreground ml-1">/{item.daily_rate ? 'day' : 'week'}</span>
</div>

// Also update the total price calculation in the rental form
const calculateTotalPrice = () => {
  if (!startDate || !endDate) return 0;
  
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const rentalDays = item.daily_rate ? days : Math.ceil(days / 7);
  
  return rentalDays * (item.price * 83); // Convert to Indian Rupees
};

// And make sure to display the total as Rupees
<div className="flex items-center justify-between font-semibold">
  <span>Total Price:</span>
  <span>₹{calculateTotalPrice().toFixed(0)}</span>
</div>
