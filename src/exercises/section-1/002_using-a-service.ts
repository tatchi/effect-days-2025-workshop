import { Array, Effect, Match } from "effect"

// A pre-defined list of misbehaviors
import { misbehaviors } from "./fixtures/Misbehaviors.js"
// The tags created in the previous exercise
import { PunDistributionNetwork } from "./shared/services/PunDistributionNetwork.js"
import { PunsterClient } from "./shared/services/PunsterClient.js"

/**
 * **Todo List**:
 *   - Use the services we've defined to write the main program's business
 *     logic in the `main` Effect below
 *
 * **Business Logic**
 *   - For each misbehavior:
 *     - Use the `PunDistributionNetwork` to get a pun delivery channel
 *       for the pun
 *     - Use the `PunsterClient` to create a pun
 *     - Use the `PunDistributionNetwork` to deliver the pun to the delivery
 *       channel
 *     - Log out the result of delivering the pun
 *
 * **Hint**: You'll probably need to access the above services somehow!
 *
 * **Bonus Objectives**:
 *
 *   **Error Handling**:
 *     - Log a warning message if a child had an immunity token
 *     - Log an error message if a pun failed to be fetched from PUNSTER
 *
 *   **Other**:
 *     - Use the `ImmunityTokenManager` to give other children immunity
 *       - check `./fixtures/Misbehaviors.ts` to see the available children
 */

export const main = Effect.gen(function*() {
  const punster = yield* PunsterClient
  const pdn = yield* PunDistributionNetwork

  return yield* Effect.forEach(
    misbehaviors,
    Effect.fn(function*(misbehavior) {
      const channel = yield* pdn.getChannel(misbehavior)
      yield* punster.createPun(misbehavior).pipe(
        Effect.andThen((pun) => pdn.deliverPun(pun, misbehavior, channel)),
        Effect.andThen((report) => Effect.log(report)),
        Effect.catchTags({
          ChildImmuneError: () =>
            Effect.logWarning(
              `Child ${misbehavior.childName} is immune, using immunity token`
            ),
          PunsterFetchError: () =>
            Effect.logError(
              `Failed to fetch pun for misbehavior: ${misbehavior}`
            )
        })
      )
    })
  )

  // return yield* Effect.all(
  //   Array.map(
  //     misbehaviors,
  //     Effect.fn(function*(misbehavior) {
  //       const channel = yield* pdn.getChannel(misbehavior)
  //       yield* punster.createPun(misbehavior).pipe(
  //         Effect.andThen((pun) => pdn.deliverPun(pun, misbehavior, channel)),
  //         Effect.andThen((report) => Effect.log(report)),
  //         Effect.catchTags({
  //           ChildImmuneError: () =>
  //             Effect.logWarning(
  //               `Child ${misbehavior.childName} is immune, using immunity token`
  //             ),
  //           PunsterFetchError: () =>
  //             Effect.logError(
  //               `Failed to fetch pun for misbehavior: ${misbehavior}`
  //             )
  //         })
  //       )
  //     })
  //   )
  // )
})
