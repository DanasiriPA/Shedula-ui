export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
};

// You can add other utility functions here as needed