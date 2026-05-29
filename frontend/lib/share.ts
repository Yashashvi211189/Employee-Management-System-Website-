// lib/share.ts


export const shareMember = (memberName: string) => {
  const slug = memberName.toLowerCase().replace(/\s+/g, '-');
  const url = `${window.location.origin}/team/${slug}`;
  
  if (navigator.share) {
    navigator.share({
      title: `Meet ${memberName} from Nilaya AI`,
      text: `Check out ${memberName}'s profile on Nilaya AI Team`,
      url: url,
    });
  } else {
    // Fallback for browsers that don't support Web Share API
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  }
};

export const shareOnTwitter = (memberName: string, role: string) => {
  const slug = memberName.toLowerCase().replace(/\s+/g, '-');
  const url = `${window.location.origin}/team/${slug}`;
  const text = `Meet ${memberName} - ${role} at Nilaya AI`;
  
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    '_blank'
  );
};

export const shareOnLinkedIn = (memberName: string) => {
  const slug = memberName.toLowerCase().replace(/\s+/g, '-');
  const url = `${window.location.origin}/team/${slug}`;
  
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    '_blank'
  );
};