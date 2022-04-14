<?php

/**
 * @copyright Copyright (C) Ibexa AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace Ibexa\AdminUi\Limitation\Mapper;

use Ibexa\AdminUi\Form\Type\ChoiceList\Loader\UserGroupsChoiceLoader;
use Ibexa\AdminUi\Limitation\LimitationFormMapperInterface;
use Ibexa\AdminUi\Limitation\LimitationValueMapperInterface;
use Ibexa\AdminUi\Translation\Extractor\LimitationTranslationExtractor;
use Ibexa\Contracts\Core\Repository\Repository;
use Ibexa\Contracts\Core\Repository\RoleService;
use Ibexa\Contracts\Core\Repository\SearchService;
use Ibexa\Contracts\Core\Repository\UserService;
use Ibexa\Contracts\Core\Repository\Values\User\Limitation;
use Psr\Log\LoggerAwareTrait;
use Psr\Log\NullLogger;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\ChoiceList\Loader\CallbackChoiceLoader;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\FormInterface;

class UserPermissionsLimitationMapper implements LimitationValueMapperInterface, LimitationFormMapperInterface
{
    use LoggerAwareTrait;

    private RoleService $roleService;

    private UserService $userService;

    private string $template;

    private Repository $repository;

    private SearchService $searchService;

    public function __construct(
        Repository $repository,
        SearchService $searchService,
        RoleService $roleService,
        UserService $userService
    ) {
        $this->logger = new NullLogger();
        $this->roleService = $roleService;
        $this->userService = $userService;
        $this->repository = $repository;
        $this->searchService = $searchService;
    }

    public function mapLimitationForm(FormInterface $form, Limitation $data)
    {
        $sub = $form
            ->getConfig()
            ->getFormFactory()
            ->createBuilder()
            ->create(
                'limitationValues',
                FormType::class,
                ['label' => LimitationTranslationExtractor::identifierToLabel($data->getIdentifier())])
            ->setAutoInitialize(false)
            ->getForm();

        $sub->add('roles', ChoiceType::class, [
            'choice_loader' => new CallbackChoiceLoader(
                function() {
                    $roles = $this->roleService->loadRoles();
                    $choices = [];
                    foreach ($roles as $role) {
                        $choices[$role->identifier] = $role->id;
                    }
                    return $choices;
                }
            ),
            'multiple' => true,
            'required' => false
        ]);

        $sub->add('user_groups', ChoiceType::class, [
            'choice_loader' => new UserGroupsChoiceLoader(
                $this->repository,
                $this->searchService,
                $this->userService
            ),
            'multiple' => true,
            'required' => false
        ]);

        $form->add($sub);


    }

    public function setFormTemplate(string $template): void
    {
        $this->template = $template;
    }

    public function getFormTemplate(): string
    {
        return $this->template;
    }

    public function filterLimitationValues(Limitation $limitation)
    {
    }

    public function mapLimitationValue(Limitation $limitation)
    {
        $values = [
            'roles' => [],
            'user_groups' => []
        ];
        foreach ($limitation->limitationValues['roles'] as $roleId) {
            $values['roles'][] = $this->roleService->loadRole($roleId);
        }
        foreach ($limitation->limitationValues['user_groups'] as $groupId) {
            $values['user_groups'][] = $this->userService->loadUserGroup($groupId);
        }

        return $values;
    }
}
