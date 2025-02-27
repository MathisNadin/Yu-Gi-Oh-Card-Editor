import { IContainableTip } from '../containable';
import { HorizontalStack } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';

export class TipService {
  public isAlreadySeen(uuid: string) {
    if (!uuid) return false;
    return !!app.$session.data?.member?.tips?.[uuid];
  }

  public async markAsSeen(uuid: string) {
    if (!app.$session.data?.member) return;
    let { member } = app.$session.data;
    member.tips = member.tips || {};
    member.tips[uuid] = true;
    member = await app.$api.member.store(member);
    await app.$session.update({ member });
  }

  public show(targetRectangle: DOMRect, tip: IContainableTip) {
    app.$popover.removeAll();
    app.$popover.walkthrough(targetRectangle, {
      focus: true,
      ignoreFocus: true,
      innerContent: (
        <HorizontalStack gutter className='mn-tip-content'>
          <Icon icon={tip.icon} />
          <Typography variant='label' content={tip.message} />
        </HorizontalStack>
      ),
      innerButtons: [
        {
          label: "J'ai compris",
          onTap: async () => {
            await app.$tips.markAsSeen(tip.uuid);
            app.$popover.removeAll();
          },
        },
      ],
    });
  }
}
