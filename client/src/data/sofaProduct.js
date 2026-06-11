const SOFA_VARIANTS = [
  {
    id: "alpine_sangria",
    material: "Alpine",
    colour: "Sangria",
    label: "Alpine Sangria",
    thumbnailUrl: "/images/sofa/colours/alpine_sangria.png",
    textureUrl: "/images/sofa/colours/alpine_sangria.png",
  },
  {
    id: "alpine_gray",
    material: "Alpine",
    colour: "Gray",
    label: "Alpine Gray",
    thumbnailUrl: "/images/sofa/colours/alpine_gray.png",
    textureUrl: "/images/sofa/colours/alpine_gray.png",
  },
  {
    id: "alpine_ivory",
    material: "Alpine",
    colour: "Ivory",
    label: "Alpine Ivory",
    thumbnailUrl: "/images/sofa/colours/alpine_ivory.png",
    textureUrl: "/images/sofa/colours/alpine_ivory.png",
  },
  {
    id: "alpine_mink",
    material: "Alpine",
    colour: "Mink",
    label: "Alpine Mink",
    thumbnailUrl: "/images/sofa/colours/alpine_mink.png",
    textureUrl: "/images/sofa/colours/alpine_mink.png",
  },
  {
    id: "alpine_pearl",
    material: "Alpine",
    colour: "Pearl",
    label: "Alpine Pearl",
    thumbnailUrl: "/images/sofa/colours/alpine_pearl.png",
    textureUrl: "/images/sofa/colours/alpine_pearl.png",
  },
  {
    id: "alpine_ice_blue",
    material: "Alpine",
    colour: "Ice Blue",
    label: "Alpine Ice Blue",
    thumbnailUrl: "/images/sofa/colours/alpine_ice_blue.png",
    textureUrl: "/images/sofa/colours/alpine_ice_blue.png",
  },
];

const DEFAULT_SOFA_MODEL_VARIANT = "alpine_ivory";

const LEFT_CONNECTABLE_ROTATION = [0, Math.PI / 2, 0];
const RIGHT_ARM_ROTATION = [0, Math.PI / 2, 0];
const CORNER_ROTATION_BY_PLACEMENT = {
  left: [0, -Math.PI / 2, 0],
  right: [0, Math.PI / 2, 0],
};

const createVariantModels = (baseModelId) =>
  SOFA_VARIANTS.reduce((acc, variant) => {
    acc[variant.id] = {
      variantId: variant.id,
      modelUrl: `/models/sofa/modules/${baseModelId}_${DEFAULT_SOFA_MODEL_VARIANT}.glb`,
    };
    return acc;
  }, {});

export const sofaProduct = {
  id: "custom-sofa-001",
  productType: "sofa",
  name: "Modular Sofa Configurator",
  basePrice: 0,

  defaultConfig: {
    modules: ["armless_1_seater_75"],
    variant: "alpine_ivory",
  },

  variants: SOFA_VARIANTS,
  fabricMaterialNames: ["Material__26", "Material__21", "Material__2"],

  moduleGroups: [
    {
      id: "without_arms",
      name: "Elements without arms (connectable)",
    },
    {
      id: "left_connectable",
      name: "Elements - Left (connectable)",
    },
    {
      id: "right_connectable",
      name: "Elements - Right (connectable)",
    },
  ],

  modules: [
    {
      id: "armless_1_seater_75",
      baseModelId: "armless_1_seater_75",
      name: "1 seat without arms",
      groupId: "without_arms",
      dimensionsLabel: "75x101 cm",
      widthCm: 75,
      depthCm: 101,
      heightCm: 78,
      price: 895,
      repeatable: true,
      thumbnailUrl: "/images/sofa/modules/armless_1_seater_75.png",
      scale: [1, 1, 1],
      offset: [0, 0, 0],
      variantModels: createVariantModels("armless_1_seater_75"),
      connectors: {
        left: "open",
        right: "open",
        back: "closed",
        front: "open",
      },
      blocksAfterSelect: [],
    },

    {
      id: "armless_1_5_seater_91",
      baseModelId: "armless_1_5_seater_90",
      name: "1.5 seater without arms",
      groupId: "without_arms",
      dimensionsLabel: "90x101 cm",
      widthCm: 91,
      depthCm: 101,
      heightCm: 78,
      price: 1045,
      repeatable: true,
      thumbnailUrl: "/images/sofa/modules/armless_1_5_seater_90.png",
      scale: [1, 1, 1],
      offset: [0, 0, 0],
      variantModels: createVariantModels("armless_1_5_seater_90"),
      connectors: {
        left: "open",
        right: "open",
        back: "closed",
        front: "open",
      },
      blocksAfterSelect: [],
    },

    {
      id: "corner_element_103",
      baseModelId: "corner_element_103",
      name: "Corner element",
      groupId: "without_arms",
      dimensionsLabel: "103x103 cm",
      widthCm: 103,
      depthCm: 103,
      heightCm: 78,
      price: 1150,
      repeatable: true,
      thumbnailUrl: "/images/sofa/modules/corner_element_103.png",
      scale: [1, 1, 1],
      turnsLayout: true,
      rotationByPlacement: CORNER_ROTATION_BY_PLACEMENT,
      offset: [0, 0, 0],
      variantModels: createVariantModels("corner_element_103"),
      connectors: {
        left: "open",
        right: "open",
        back: "closed",
        front: "open",
      },
      blocksAfterSelect: [],
    },

  

    {
      id: "left_1_seater_arm_105",
      baseModelId: "left_1_seater_arm_105",
      name: "1 seater + arm",
      groupId: "left_connectable",
      dimensionsLabel: "105x101 cm",
      widthCm: 105,
      depthCm: 101,
      heightCm: 78,
      price: 1195,
      repeatable: false,
      thumbnailUrl: "/images/sofa/modules/left_1_5_seater_arm_105.png",
      scale: [1, 1, 1],
      rotation: LEFT_CONNECTABLE_ROTATION,
      offset: [0, 0, 0],
      variantModels: createVariantModels("left_1_seater_arm_105"),
      connectors: {
        left: "closed",
        right: "open",
        back: "closed",
        front: "open",
      },
      blocksAfterSelect: ["left_connectable"],
    },

    {
      id: "left_1_5_seater_arm_120",
      baseModelId: "left_1_5_seater_arm_120",
      name: "1.5 seater + arm",
      groupId: "left_connectable",
      dimensionsLabel: "120x101 cm",
      widthCm: 120,
      depthCm: 101,
      heightCm: 78,
      price: 1295,
      repeatable: false,
      thumbnailUrl: "/images/sofa/modules/left_1_5_seater_arm_120.png",
      scale: [1, 1, 1],
      rotation: LEFT_CONNECTABLE_ROTATION,
      offset: [0, 0, 0],
      variantModels: createVariantModels("left_1_5_seater_arm_120"),
      connectors: {
        left: "closed",
        right: "open",
        back: "closed",
        front: "open",
      },
      blocksAfterSelect: ["left_connectable"],
    },

    {
      id: "longchair_left_130",
      baseModelId: "longchair_left_130",
      name: "Longchair",
      groupId: "left_connectable",
      dimensionsLabel: "130x161 cm",
      widthCm: 130,
      depthCm: 161,
      connectionWidthCm: 119.4,
      connectionDepthCm: 169.2,
      heightCm: 78,
      price: 1595,
      repeatable: false,
      thumbnailUrl: "/images/sofa/modules/longchair_left_130.png",
      scale: [1, 1, 1],
      offset: [0, 0, 0],
      variantModels: createVariantModels("longchair_left_130"),
      connectors: {
        left: "closed",
        right: "open",
        back: "closed",
        front: "open",
      },
      blocksAfterSelect: ["left_connectable"],
    },

    {
      id: "right_1_seater_arm_105",
      baseModelId: "right_1_seater_arm_105",
      name: "1 seater + arm",
      groupId: "right_connectable",
      dimensionsLabel: "105x101 cm",
      widthCm: 105,
      depthCm: 101,
      heightCm: 78,
      price: 1195,
      repeatable: false,
      thumbnailUrl: "/images/sofa/modules/right1_1_5_seater_arm_105.png",
      scale: [1, 1, 1],
      rotation: RIGHT_ARM_ROTATION,
      offset: [0, 0, 0],
      variantModels: createVariantModels("right_1_seater_arm_105"),
      connectors: {
        left: "open",
        right: "closed",
        back: "closed",
        front: "open",
      },
      blocksAfterSelect: ["right_connectable"],
    },

    {
      id: "right_1_5_seater_arm_120",
      baseModelId: "right1_1_5_seater_arm_120",
      name: "1.5 seater + arm",
      groupId: "right_connectable",
      dimensionsLabel: "120x101 cm",
      widthCm: 120,
      depthCm: 101,
      heightCm: 78,
      price: 1295,
      repeatable: false,
      thumbnailUrl: "/images/sofa/modules/right_1_5_seater_arm_120.png",
      scale: [1, 1, 1],
      rotation: RIGHT_ARM_ROTATION,
      offset: [0, 0, 0],
      variantModels: createVariantModels("right1_1_5_seater_arm_120"),
      connectors: {
        left: "open",
        right: "closed",
        back: "closed",
        front: "open",
      },
      blocksAfterSelect: ["right_connectable"],
    },

    {
      id: "longchair_right_130",
      baseModelId: "longchair_right_130",
      name: "Longchair",
      groupId: "right_connectable",
      dimensionsLabel: "130x161 cm",
      widthCm: 130,
      depthCm: 161,
      connectionWidthCm: 119.4,
      connectionDepthCm: 169.2,
      heightCm: 78,
      price: 1595,
      repeatable: false,
      thumbnailUrl: "/images/sofa/modules/longchair_right_130.png",
      scale: [1, 1, 1],
      offset: [0, 0, 0],
      variantModels: createVariantModels("longchair_right_130"),
      connectors: {
        left: "open",
        right: "closed",
        back: "closed",
        front: "open",
      },
      blocksAfterSelect: ["right_connectable"],
    },
  ],

  rules: {
    maxOneFromGroups: ["left_connectable", "right_connectable"],
    incompatibleModules: [],
  },
};

export const getSofaModuleModelUrl = (module, selectedVariantId) => {
  return module.variantModels?.[selectedVariantId]?.modelUrl || null;
};
