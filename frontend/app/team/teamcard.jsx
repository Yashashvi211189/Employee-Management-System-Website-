<CardContent className="p-4 text-center">
  <img
    src={member.image}
    alt={member.name}
    className="w-24 h-24 mx-auto rounded-full object-cover"
  />
  <h3 className="mt-3 text-lg font-semibold">{member.name}</h3>
  <p className="text-sm text-gray-500">{member.role}</p>
  <p className="text-sm text-gray-600 mt-2">{member.shortBio}</p>
</CardContent>
