// // utils/populateParents.ts
// import { Pigeon } from "../app/modules/pigeon copy/pigeon.model";

// export const populateParentsRecursive = async (pigeonId: string, depth: number = 3) => {
//   if (!pigeonId || depth <= 0) return null;

//   const pigeon = await Pigeon.findById(pigeonId)
//     .select("ringNumber name gender country birthYear color pattern parents")
//     .lean();

//   if (!pigeon) return null;

//   // recursively populate parents
//   if (pigeon.parents && pigeon.parents.length > 0) {
//     const populatedParents = [];
//     for (const parent of pigeon.parents) {
//       const parentData = await populateParentsRecursive(parent.pigeon.toString(), depth - 1);
//       populatedParents.push({
//         relation: parent.relation,
//         pigeon: parentData,
//       });
//     }
//     pigeon.parents = populatedParents;
//   }

//   return pigeon;
// };
