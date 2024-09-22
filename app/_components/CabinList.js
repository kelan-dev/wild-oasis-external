import React from "react";
import CabinCard from "./CabinCard";
import { getCabins } from "../_lib/data-service";

export default async function CabinList({ filter }) {
  const cabins = await getCabins();

  let filteredCabins;

  if (filter === "all") {
    filteredCabins = cabins;
  }

  if (filter === "small") {
    filteredCabins = cabins.filter((cabin) => {
      return cabin.maxCapacity <= 3;
    });
  }

  if (filter === "medium") {
    filteredCabins = cabins.filter((cabin) => {
      return cabin.maxCapacity >= 4 && cabin.maxCapacity <= 7;
    });
  }

  if (filter === "large") {
    filteredCabins = cabins.filter((cabin) => {
      return cabin.maxCapacity >= 8;
    });
  }

  return (
    <>
      {filteredCabins.length > 0 && (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
          {filteredCabins.map((cabin) => (
            <CabinCard cabin={cabin} key={cabin.id} />
          ))}
        </div>
      )}
    </>
  );
}
