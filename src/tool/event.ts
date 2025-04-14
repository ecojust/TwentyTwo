import { computed } from "vue";

export default class Event {
  static longPress(longPressDuration: number = 3000, callback?: Function) {
    let longPressTimer: number;

    const startLongPress = () => {
      cancelLongPress();
      longPressTimer = setTimeout(() => {
        callback && callback();
      }, longPressDuration);
    };

    const cancelLongPress = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = -1;
      }
    };

    const longPressEvents = computed(() => {
      return {
        mousedown: startLongPress,
        mouseup: cancelLongPress,
        mouseleave: cancelLongPress,
        touchstart: startLongPress,
        touchend: cancelLongPress,
        touchcancel: cancelLongPress,
      };
    });

    return longPressEvents;
  }
}
