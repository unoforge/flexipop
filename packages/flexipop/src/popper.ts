import { DEFAULT_OFFSETDISTANCE, DEFAULT_PLACEMENT } from "./const";
import { getDimensions } from "./utils";
import { Placement, PopperOptions } from "./types";
import { determinePosition } from "./withFixed/helpers";

class CreatePopper {
    private reference: HTMLElement
    private popper: HTMLElement
    private offsetDistance: number
    private placement: Placement
    private disableOnResize: boolean
    private disableOnScroll: boolean
    private onUpdate: (({ x, y, placement }: { x: number, y: number, placement: Placement }) => void) | undefined
    private isEventRegistrer: boolean

    /**
     * Flexilla Popper 
     * @param reference 
     * @param popper 
     * @param options 
     */
    constructor(reference: HTMLElement, popper: HTMLElement, options: PopperOptions = {}) {
        const {
            offsetDistance = DEFAULT_OFFSETDISTANCE,
            placement = DEFAULT_PLACEMENT,
            eventEffect = {},
            onUpdate
        } = options
        if (!(reference instanceof HTMLElement)) throw new Error("Invalid HTMLElement for Reference Element");
        if (!(popper instanceof HTMLElement)) throw new Error("Invalid HTMLElement for Popper");
        if (options.offsetDistance && typeof options.offsetDistance !== "number") throw new Error("OffsetDistance must be a number");

        const { disableOnResize, disableOnScroll } = eventEffect
        this.isEventRegistrer = false
        this.reference = reference
        this.popper = popper
        this.offsetDistance = offsetDistance
        this.placement = placement
        this.disableOnResize = disableOnResize || false
        this.disableOnScroll = disableOnScroll || false
        this.onUpdate = onUpdate
    }

    /**
     * Validate Elements, check if reference and popper are valid HtmlELment
     */
    private validateElements = (): void => {
        if (!(this.reference instanceof HTMLElement)) throw new Error("Invalid HTMLElement for Reference Element");
        if (!(this.popper instanceof HTMLElement)) throw new Error("Invalid HTMLElement for Popper");
        if (typeof this.offsetDistance !== "number") throw new Error("OffsetDistance must be a number");
    };

    /**
     * Set Style Property
     */
    private setPopperStyleProperty = (x: number, y: number) => {
        this.popper.style.setProperty("--fx-popper-placement-x", `${x}px`)
        this.popper.style.setProperty("--fx-popper-placement-y", `${y}px`)
    }

    private setInitialStyles = (): void => {
        this.popper.style.setProperty("--fx-popper-placement-x", "")
        this.popper.style.setProperty("--fx-popper-placement-y", "")
    };

    private initPlacement = (placement?: Placement, offsetDistance?: number): void => {
        this.validateElements();
        this.setInitialStyles();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const { popperHeight, popperWidth, refHeight, refWidth, refLeft, refTop } = getDimensions({ reference: this.reference, popper: this.popper });
        const { x, y } = determinePosition(
            {
                placement: placement || this.placement,
                refWidth,
                refTop,
                refLeft,
                popperWidth,
                refHeight,
                popperHeight,
                windowHeight,
                windowWidth,
                offsetDistance: offsetDistance || this.offsetDistance
            }
        );

        this.setPopperStyleProperty(x, y)
        this.onUpdate?.({ x, y, placement: placement || this.placement })
    };

    /**
     * Add event Listeners : window resize and scroll
     * These events depend on if it's disable or not
     */
    private attachWindowEvent = () => {
        if (!this.disableOnResize) {
            window.addEventListener("resize", this.initPositionate);
        }
        if (!this.disableOnScroll)
            window.addEventListener("scroll", this.initPositionate)
        this.isEventRegistrer = true
    }

    private initPositionate = (): void => {
        this.initPlacement();
    };

    resetPosition = () => {
        this.setInitialStyles()
    }

    updatePosition() {
        this.initPositionate()
        this.attachWindowEvent()
    }

    setOptions({ placement, offsetDistance }: { placement: Placement, offsetDistance?: number }) {
        this.initPlacement(placement, offsetDistance)
        if (this.isEventRegistrer) this.cleanEvents()
        this.attachWindowEvent()
    }

    private cleanEvents = () => {
        !this.disableOnResize && window.removeEventListener("resize", this.initPositionate);
        !this.disableOnScroll && window.removeEventListener("scroll", this.initPositionate);
    }

    /**
     * Remove event listerners in case they are no longer needed
     */
    cleanupEvents = (): void => {
        this.setInitialStyles()
        if (this.isEventRegistrer) {
            this.cleanEvents()
            this.isEventRegistrer = false
        }
    };

}

/**
 * Shortcut of : new CreatePopper(...)
 * @param reference 
 * @param popper 
 * @param options 
 * @returns 
 */
export const fCreatePopper = (reference: HTMLElement, popper: HTMLElement, options: PopperOptions = {}) => new CreatePopper(reference, popper, options)
export default CreatePopper