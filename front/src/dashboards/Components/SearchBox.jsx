import { Search } from "lucide-react";

const SearchBox = ({ value, onChange, placeholder }) => {
  return (
    <div className=" w-full max-w-md mb-6 ">
      <Search
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
};

export default SearchBox;
