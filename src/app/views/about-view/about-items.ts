import {DeskItem} from './about-view.component';

export const AboutItems: DeskItem[] = [
  {
    "id": "notebook",
    "type": "table",
    "y": -85,
    "x": 0,
    "showOnSmallScreen": true,
    "topOffsetsTooltip": {
      "notebook_on": 20,
      "notebook_off": 20
    },
    "states": [
      "notebook_on",
      "notebook_off"
    ],
    "stateTooltips": {
      "notebook_on": "Work work work work.",
      "notebook_off": "Battery low again."
    },
    "currentStateIndex": 0
  },
  {
    "id": "item",
    "type": "table",
    "y": -64,
    "x": -254,
    "showOnSmallScreen": false,
    "topOffsetsTooltip": {
      "dino": -20,
      "lama": -20,
      "buddha": -15,
      "treetrunks": -50
    },
    "states": [
      "dino",
      "lama",
      "buddha",
      "treetrunks"
    ],
    "stateTooltips": {
      "dino": "'Roar' means 'I love you' in dinosaur.",
      "lama": "No drama, just llama.",
      "buddha": "Ommmm.",
      "treetrunks": "Have you tried my apple pie?"
    },
    "currentStateIndex": 1
  },
  {
    "id": "left_photo",
    "type": "wall",
    "y": -337,
    "x": -269,
    "showOnSmallScreen": false,
    "topOffsetsTooltip": {
      "shiba_photo": -20
    },
    "states": [
      "shiba_photo"
    ],
    "stateTooltips": {
      "shiba_photo": "My dogs - always watching."
    },
    "currentStateIndex": 0
  },
  {
    "id": "pencils",
    "type": "table",
    "y": -100,
    "x": -140,
    "showOnSmallScreen": true,
    "topOffsetsTooltip": {
      "pencils": -20,
      "vase": 10,
      "paper_garbage": -100
    },
    "states": [
      "pencils",
      "vase",
      "paper_garbage"
    ],
    "stateTooltips": {
      "pencils": "My swords of choice.",
      "vase": "Sweet.",
      "paper_garbage": "That was a bad idea."
    },
    "currentStateIndex": 2
  },
  {
    "id": "right_photo",
    "type": "wall",
    "y": -437,
    "x": 270,
    "showOnSmallScreen": false,
    "topOffsetsTooltip": {
      "family": 20
    },
    "states": [
      "family"
    ],
    "stateTooltips": {
      "family": "My family."
    },
    "currentStateIndex": 0
  },
  {
    "id": "coffee",
    "type": "table",
    "y": -102,
    "x": 140,
    "showOnSmallScreen": true,
    "topOffsetsTooltip": {
      "coffee": -50,
      "iced_coffee": -10
    },
    "states": [
      "coffee",
      "iced_coffee"
    ],
    "stateTooltips": {
      "coffee": "Coffee. Because adulting is hard.",
      "iced_coffee": "Summer mode: Activated."
    },
    "currentStateIndex": 1
  }
]
