export const listings = [
  {
    id: '1',
    title: 'Green Valley Estate',
    location: 'Lagos, Nigeria',
    price: '₦45,000,000',
    image: 'https://picsum.photos/400/300',
    status: 'Pending',
    seller: 'John Doe',
  },
  {
    id: '2',
    title: 'Ocean View Land',
    location: 'Lekki, Lagos',
    price: '₦80,000,000',
    image: 'https://picsum.photos/400/301',
    status: 'Approved',
    seller: 'Jane Smith',
  },
];

export const reports = [
  {
    id: '1',
    reason: 'Inappropriate Content',
    listing: 'Green Valley Estate',
    reporter: 'Alex Johnson',
    status: 'Open',
  },
  {
    id: '2',
    reason: 'Fake Information',
    listing: 'Ocean View Land',
    reporter: 'Chris Williams',
    status: 'Open',
  },
];

export const verifications = [
  {
    id: '1',
    name: 'John Doe',
    type: 'ID Card',
    submitted: '2h ago',
    status: 'Pending',
  },
  {
    id: '2',
    name: 'Jane Smith',
    type: 'Land Title',
    submitted: '5h ago',
    status: 'Pending',
  },
];