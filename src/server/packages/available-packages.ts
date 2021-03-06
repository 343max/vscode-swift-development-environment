import * as path from "path";
import { descriptionPackage } from "./description-package";
import { Package, Target } from "../package";
import { swiftFilePackage } from "./swift-file-package";
import { debugYamlPackage } from "./debug-yaml-package";
import { configPackage } from "./config-package";

export const availablePackages: Package = async fromPath => {
  const [
    configTargets,
    debugYamlTargets,
    descriptionTargets,
    swiftFileTargets
  ] = await Promise.all([
    configPackage(fromPath),
    debugYamlPackage(fromPath),
    descriptionPackage(fromPath),
    swiftFilePackage(fromPath)
  ]);
  return flatteningTargetsWithUniqueSources(
    configTargets,
    debugYamlTargets,
    descriptionTargets,
    swiftFileTargets
  );
};

function flatteningTargetsWithUniqueSources(...targets: Target[][]) {
  return targets.reduce(
    (current, next) => [...current, ...removingDuplicateSources(next, current)],
    []
  );
}

function removingDuplicateSources(
  fromTargets: Target[],
  uniqueTargets: Target[]
): Target[] {
  return fromTargets.map(target => {
    const swiftFilesWithoutTargets = Array.from(target.sources).filter(
      source =>
        uniqueTargets.findIndex(desc =>
          desc.sources.has(
            path.relative(desc.path, path.resolve(target.path, source))
          )
        ) === -1
    );
    return { ...target, sources: new Set(swiftFilesWithoutTargets) };
  });
}
